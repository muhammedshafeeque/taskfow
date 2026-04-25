import mongoose from 'mongoose';
import { Organization } from '../modules/organizations/organization.model';
import { OrganizationMember } from '../modules/organizations/organizationMember.model';
import { Project } from '../modules/projects/project.model';
import { CustomerOrg } from '../modules/customer-portal/customer-org/customerOrg.model';
import { User } from '../modules/auth/user.model';

/**
 * Idempotent: default TaskFlow organization, backfill FKs, members, project indexes.
 */
export async function migrateOrganizationTenancyIfNeeded(): Promise<void> {
  const db = mongoose.connection.db;
  if (!db) return;

  const projectsCol = db.collection('projects');

  let defaultOrgId: mongoose.Types.ObjectId | undefined;
  const existingOrg = await Organization.findOne().sort({ createdAt: 1 }).lean();
  if (existingOrg?._id) {
    defaultOrgId = existingOrg._id as mongoose.Types.ObjectId;
  } else {
    const firstUser =
      (await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).lean()) ??
      (await User.findOne().sort({ createdAt: 1 }).lean());
    if (!firstUser) {
      console.log('[migrate] organizations: no users — skip org bootstrap');
      return;
    }
    const name = process.env.DEFAULT_ORGANIZATION_NAME || 'Default workspace';
    let slug = (process.env.DEFAULT_ORGANIZATION_SLUG || 'default').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'default';
    let attempt = 0;
    while (await Organization.exists({ slug })) {
      attempt += 1;
      slug = `default-${attempt}`;
    }
    const created = await Organization.create({
      name,
      slug,
      description: 'Default TaskFlow workspace (migration)',
      createdBy: firstUser._id,
      status: 'active',
    });
    defaultOrgId = created._id as mongoose.Types.ObjectId;
    console.log(`[migrate] organizations: created default org ${String(created._id)} slug=${slug}`);
  }

  if (!defaultOrgId) {
    console.warn('[migrate] organizations: no default org id — skip FK backfill');
    return;
  }

  const projMissing = await Project.countDocuments({
    $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }],
  });
  if (projMissing > 0) {
    await Project.updateMany(
      { $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }] },
      { $set: { taskflowOrganizationId: defaultOrgId } }
    );
    console.log(`[migrate] projects: set taskflowOrganizationId on ${projMissing} document(s)`);
  }

  const custMissing = await CustomerOrg.countDocuments({
    $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }],
  });
  if (custMissing > 0) {
    await CustomerOrg.updateMany(
      { $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }] },
      { $set: { taskflowOrganizationId: defaultOrgId } }
    );
    console.log(`[migrate] customerorgs: set taskflowOrganizationId on ${custMissing} document(s)`);
  }

  const templatesCol = db.collection('projecttemplates');
  const tplMissing = await templatesCol.countDocuments({
    $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }],
  });
  if (tplMissing > 0) {
    await templatesCol.updateMany(
      { $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }] },
      { $set: { taskflowOrganizationId: defaultOrgId } }
    );
    console.log(`[migrate] projecttemplates: set taskflowOrganizationId on ${tplMissing} document(s)`);
  }

  const reportsCol = db.collection('reports');
  const repCursor = reportsCol.find({
    $or: [{ taskflowOrganizationId: { $exists: false } }, { taskflowOrganizationId: null }],
  });
  let repUpdated = 0;
  for await (const doc of repCursor) {
    let tfOrg = defaultOrgId;
    const projId = (doc as { project?: unknown }).project;
    if (projId) {
      const p = await projectsCol.findOne(
        { _id: projId as mongoose.Types.ObjectId },
        { projection: { taskflowOrganizationId: 1 } }
      );
      const pOrg = p && (p as { taskflowOrganizationId?: unknown }).taskflowOrganizationId;
      if (pOrg) tfOrg = pOrg as typeof defaultOrgId;
    }
    await reportsCol.updateOne(
      { _id: (doc as { _id: mongoose.Types.ObjectId })._id },
      { $set: { taskflowOrganizationId: tfOrg } }
    );
    repUpdated += 1;
  }
  if (repUpdated > 0) {
    console.log(`[migrate] reports: set taskflowOrganizationId on ${repUpdated} document(s)`);
  }

  const users = await User.find().select('_id').lean();
  let membersAdded = 0;
  for (const u of users) {
    const res = await OrganizationMember.updateOne(
      { organization: defaultOrgId, user: u._id },
      {
        $setOnInsert: {
          organization: defaultOrgId,
          user: u._id,
          role: 'org_admin',
          status: 'active',
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount) membersAdded += 1;
  }
  if (membersAdded > 0) {
    console.log(`[migrate] organizationmembers: upserted ${membersAdded} membership row(s) for default org`);
  }

  try {
    await projectsCol.dropIndex('key_1');
    console.log('[migrate] projects: dropped legacy unique index key_1');
  } catch (e: unknown) {
    const code = (e as { code?: number }).code;
    if (code !== 27) {
      console.warn('[migrate] projects: could not drop key_1 (may not exist):', (e as Error).message);
    }
  }

  try {
    await Project.syncIndexes();
    console.log('[migrate] projects: syncIndexes complete');
  } catch (e) {
    console.error('[migrate] projects: syncIndexes failed — resolve duplicate (org,key) manually:', e);
  }
}
