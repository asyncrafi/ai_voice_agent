from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("training", "0002_default_scripts"),
    ]

    operations = [
        migrations.AddField(
            model_name="trainingscript",
            name="duration_minutes",
            field=models.PositiveIntegerField(default=30),
        ),
    ]
