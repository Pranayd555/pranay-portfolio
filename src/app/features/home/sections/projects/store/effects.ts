import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ProjectsService } from "../services/projects-service";
import * as ProjectsActions from "./actions";
import { catchError, map, of, switchMap } from "rxjs";

@Injectable()
export class ProjectsEffects {
    private actions$ = inject(Actions);
    private projectsService = inject(ProjectsService);

    getProjects$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectsActions.getProjects),
            switchMap(() =>
                this.projectsService.getProjects().pipe(
                    map((projects) => ProjectsActions.getProjectsSuccess({ projects })),
                    catchError((error) => of(ProjectsActions.getProjectsFailure({ error: error.message || 'Failed to load projects' })))
                )
            )
        )
    );
}