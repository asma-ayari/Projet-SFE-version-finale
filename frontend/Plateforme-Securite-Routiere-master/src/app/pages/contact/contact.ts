import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private translate = inject(TranslateService);

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  isSubmitting = signal(false);
  isSubmitted = signal(false);

  contactInfo = [
    {
      icon: 'fa-map-marker-alt',
      title: 'Adresse',
      content: 'Rue Ahmed Skolli - Immeuble Alambra 2\n1er étage - 3027 - Sfax'
    },
    {
      icon: 'fa-phone',
      title: 'Téléphone',
      content: '+216 20 412 543'
    },
    {
      icon: 'fa-envelope',
      title: 'Email',
      content: 'tsecuriteroutiere.sfax@gmail.com'
    },
    {
      icon: 'fa-clock',
      title: 'Horaires',
      content: 'Lun - Ven: 8h00 - 17h00\nSam: 8h00 - 12h00'
    }
  ];

  getHoursRows() {
    const isAr = this.translate.currentLang === 'ar';
    return [
      {
        day: isAr ? 'الاثنين - الجمعة' : 'Lundi - Vendredi',
        time: isAr ? '8:00 - 17:00' : '8h00 - 17h00'
      },
      {
        day: isAr ? 'السبت' : 'Samedi',
        time: isAr ? '8:00 - 12:00' : '8h00 - 12h00'
      }
    ];
  }

  onSubmit() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSubmitted.set(true);
      this.formData = { name: '', email: '', subject: '', message: '' };
    }, 1500);
  }
}
