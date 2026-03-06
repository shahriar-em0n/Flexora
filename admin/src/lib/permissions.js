// RBAC permissions config  (roles match DB schema: superadmin | admin | manager)
// Usage: hasPermission(user.role, 'products.edit') → true/false

export const PERMISSIONS = {
    superadmin: [
        'dashboard.view', 'dashboard.full',
        'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import',
        'orders.view', 'orders.update', 'orders.bkash_verify', 'orders.refund', 'orders.invoice', 'orders.manual_create',
        'customers.view', 'customers.edit', 'customers.block',
        'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
        'coupons.view', 'coupons.create', 'coupons.edit', 'coupons.delete',
        'reviews.view', 'reviews.moderate',
        'analytics.view', 'analytics.export',
        'users.view', 'users.create', 'users.edit', 'users.delete',
        'audit_log.view',
        'settings.view', 'settings.edit',
    ],
    admin: [
        'dashboard.view', 'dashboard.full',
        'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import',
        'orders.view', 'orders.update', 'orders.bkash_verify', 'orders.refund', 'orders.invoice', 'orders.manual_create',
        'customers.view', 'customers.edit', 'customers.block',
        'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
        'coupons.view', 'coupons.create', 'coupons.edit', 'coupons.delete',
        'reviews.view', 'reviews.moderate',
        'analytics.view', 'analytics.export',
    ],
    manager: [
        'dashboard.view',
        'orders.view', 'orders.update',
        'reviews.view', 'reviews.moderate',
    ],
}

export const ROLE_LABELS = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    manager: 'Moderator',
}

export const ROLE_COLORS = {
    superadmin: 'badge-error',
    admin: 'badge-primary',
    manager: 'badge-muted',
}

// Also support legacy role names from older code
const ROLE_ALIASES = {
    super_admin: 'superadmin',
    moderator: 'manager',
}

export const hasPermission = (role, permission) => {
    const normalized = ROLE_ALIASES[role] || role
    return PERMISSIONS[normalized]?.includes(permission) ?? false
}
