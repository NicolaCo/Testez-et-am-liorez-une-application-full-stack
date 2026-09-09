import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { Teacher } from '../../../../core/models/teacher.interface';
import { SessionService } from '../../../../core/service/session.service';
import { TeacherService } from '../../../../core/service/teacher.service';
import { Session } from '../../../../core/models/session.interface';
import { SessionApiService } from '../../../../core/service/session-api.service';
import { MaterialModule } from "../../../../shared/material.module";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-detail',
  imports: [CommonModule, MaterialModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  public session: Session | undefined;
  public teacher: Teacher | undefined;
  public isParticipate = false;
  public isAdmin = false;
  public sessionId: string;
  public userId: string;

  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private sessionService = inject(SessionService);
  private sessionApiService = inject(SessionApiService);
  private teacherService = inject(TeacherService);
  private matSnackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.sessionId = this.route.snapshot.paramMap.get('id')!;
    this.isAdmin = this.sessionService.sessionInformation!.admin;
    this.userId = this.sessionService.sessionInformation!.id.toString();
  }

  ngOnInit(): void {
    this.fetchSession().subscribe();
  }

  public back() {
    window.history.back();
  }

  public delete(): Observable<void> {
    return this.sessionApiService
      .delete(this.sessionId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.matSnackBar.open('Session deleted !', 'Close', { duration: 3000 });
          this.router.navigate(['sessions']);
        }),
      );
  }

  public participate(): Observable<void> {
    return this.sessionApiService
      .participate(this.sessionId, this.userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.fetchSession()),
      );
  }

  public unParticipate(): Observable<void> {
    return this.sessionApiService
      .unParticipate(this.sessionId, this.userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(() => this.fetchSession()),
      );
  }

  public onDelete(): void {
    this.delete().subscribe({
      error: () => this.matSnackBar.open('Unable to delete the session', 'Close', { duration: 3000 }),
    });
  }

  public onParticipate(): void {
    this.participate().subscribe({
      error: () => this.matSnackBar.open('Unable to participate', 'Close', { duration: 3000 }),
    });
  }

  public onUnParticipate(): void {
    this.unParticipate().subscribe({
      error: () => this.matSnackBar.open('Unable to withdraw', 'Close', { duration: 3000 }),
    });
  }

  private fetchSession(): Observable<void> {
    return this.sessionApiService
      .detail(this.sessionId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((session: Session) => {
          this.session = session;
          this.isParticipate = session.users.some(u => u === this.sessionService.sessionInformation!.id);
        }),
        mergeMap((session: Session) =>
          this.teacherService
            .detail(session.teacher_id.toString())
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              tap((teacher: Teacher) => this.teacher = teacher),
            ),
        ),
        map(() => undefined),
      );
  }

}
