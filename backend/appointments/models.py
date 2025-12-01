from django.db import models
from django.conf import settings
from services.models import Service
from staff.models import Staff

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('booked', 'Booked'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    date = models.DateField(blank=True, null=True)
    scheduled_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='booked')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_time']
    
    def __str__(self):
        return f"{self.client} - {self.service} - {self.scheduled_time}"
    
    def save(self, *args, **kwargs):
        from datetime import timedelta
        if not self.end_time and self.service:
            self.end_time = self.scheduled_time + timedelta(minutes=self.service.duration)
        super().save(*args, **kwargs)