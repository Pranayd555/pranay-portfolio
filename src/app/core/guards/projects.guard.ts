import { ActivatedRouteSnapshot, CanActivateFn, Router } from "@angular/router";
import { VALID_PROJECT_SLUGS } from "../config/project.config";
import { inject } from "@angular/core";

    export const projectGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
        const project = route.params['project'];
        const router = inject(Router)
        if (VALID_PROJECT_SLUGS.has(project)) {
            return true;
          }
        
          // Instead of returning false (which leaves a blank page), redirect to fallback
          return router.createUrlTree(['/projects']);
    }

