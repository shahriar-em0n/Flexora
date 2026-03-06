import { useAdminAuth } from '../../contexts/AuthContext'

/**
 * Conditionally render children based on a permission string.
 * <RoleGuard can="products.edit"> <EditButton /> </RoleGuard>
 */
export default function RoleGuard({ can, children, fallback = null }) {
    const { can: hasCan } = useAdminAuth()
    if (!hasCan(can)) return fallback
    return children
}
