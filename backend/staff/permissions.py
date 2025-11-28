from rest_framework import permissions

class IsAdminUserCustom(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            getattr(request.user, "is_authenticated", False) and 
            getattr(request.user, "user_type", "") == "admin"
        )