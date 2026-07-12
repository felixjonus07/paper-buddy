class PermissionContext {
  /**
   * Resolves the current user's permissions and role.
   * @param {Object} user - The req.user object from authentication middleware
   */
  resolveContext(user) {
    // Fallbacks if user is not fully populated
    const context = {
      userId: user?._id || 'anonymous',
      role: user?.role || 'guest',
      permissions: user?.permissions || [],
      organizationId: user?.organizationId || 'default_org'
    };

    // If role is admin, inject super permissions for the agent
    if (context.role === 'admin') {
      context.permissions = ['manage_users', 'manage_fees', 'manage_groups', 'send_communications', '*'];
    }

    return context;
  }

  formatForPrompt(contextData) {
    return `[USER CONTEXT]\\nRole: ${contextData.role}\\nPermissions: ${contextData.permissions.join(', ')}`;
  }
}

module.exports = new PermissionContext();
