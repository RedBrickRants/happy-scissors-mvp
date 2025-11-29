from django.db import models
from django.conf import settings
from services.models import Service


# model to store staff member details
class Staff(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expertise = models.TextField(blank=True)
    services = models.ManyToManyField(Service, related_name='qualified_staff')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.get_full_name() or self.user.username