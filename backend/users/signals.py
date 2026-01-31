# users/signals.py - Can be deleted or kept minimal
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser


@receiver(post_save, sender=CustomUser)
def update_user_profile_status(sender, instance, **kwargs):
    """
    Optional signal for additional logic when user is saved.
    Keep signals minimal - most logic should be in services.
    """
    pass