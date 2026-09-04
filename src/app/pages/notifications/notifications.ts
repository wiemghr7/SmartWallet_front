import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  chargement = true;

  constructor(
    private service: NotificationService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.service.lister().subscribe({
      next: (data) => {
        this.notifications = data;
        this.chargement = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.chargement = false;
        this.cd.detectChanges();
      },
    });
  }
}
