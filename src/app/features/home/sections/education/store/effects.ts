import { inject, Injectable } from "@angular/core";
import { EducationService } from "../services/education-service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as EducationActions from './actions';
import { catchError, map, of, switchMap } from "rxjs";
import { IEducationSection } from "../types/education.model";

@Injectable()
export class EducationEffects {
    private educationService = inject(EducationService);
    private actions$ = inject(Actions);


    getEducation$ = createEffect(() => this.actions$.pipe(
        ofType(EducationActions.getEducation),
        switchMap(() => {
            return this.educationService.getEducation().pipe(
                map((education: IEducationSection) => EducationActions.getEducationSuccess({ education })),
                catchError((error) => of(EducationActions.getEducationFailure({ error })))
            )
        })
    ))
}