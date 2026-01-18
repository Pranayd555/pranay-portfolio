import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { SkillsService } from "../services/skills-service";
import { getSkills, getSkillsFailure, getSkillsSuccess } from "./actions";
import { catchError, map, of, switchMap } from "rxjs";

@Injectable()
export class SkillsEffects {
    private actions$ = inject(Actions);
    private skillsService = inject(SkillsService);

    getSkills$ = createEffect(() => this.actions$.pipe(
        ofType(getSkills),
        switchMap(() => this.skillsService.getSkills().pipe(
            map((skills) => getSkillsSuccess({ skills })),
            catchError((error) => of(getSkillsFailure({ error })))
        ))
    ))
}