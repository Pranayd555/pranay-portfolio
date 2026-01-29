import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as ProjectDetailsActions from "./actions";
import { catchError, map, of, switchMap } from "rxjs";
import { ProjectsService } from "../../services/projects-service";

@Injectable()
export class ProjectDetailsEffects {

    private actions$ = inject(Actions);
    private projectService = inject(ProjectsService);


    getProjectsById$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ProjectDetailsActions.getProjectById),
            switchMap((action) => this.projectService.getProjectById(action.projectId).pipe(
                map((project) => ProjectDetailsActions.getProjectByIdSuccess({ project })),
                catchError(err => of(ProjectDetailsActions.getProjectByIdFailure({ error: err.message })))
            )
            )
        ))
}