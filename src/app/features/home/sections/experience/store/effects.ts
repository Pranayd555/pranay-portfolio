import { inject, Injectable } from "@angular/core";
import { ExperienceService } from "../services/experience-service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ExperienceActions from "./actions";
import { catchError, map, of, switchMap } from "rxjs";

@Injectable()
export class ExperienceEffects {
    private experienceService = inject(ExperienceService);
    private actions$ = inject(Actions);

    getExperience$ = createEffect(() => this.actions$.pipe(
        ofType(ExperienceActions.getExperience),
        switchMap(() => this.experienceService.getExperience().pipe(
            map((experience) => ExperienceActions.getExperienceSuccess({ experience })),
            catchError((error) => of(ExperienceActions.getExperienceFailure({ error })))
        ))
    ))
}
