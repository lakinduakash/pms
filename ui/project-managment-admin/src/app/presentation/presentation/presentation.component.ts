import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../services/project.service";
import {FormDataService} from "../../services/form-data.service";
import {RenameTitleBarService} from "../../services/rename-title-bar.service";
import {MatDialog} from "@angular/material";
import {EvalListComponent} from "../eval-list/eval-list.component";

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.css']
})
export class PresentationComponent implements OnInit, OnDestroy {

  projectId
  originalPId;
  presentId;

  panelState: boolean

  onceLoaded = false;


  constructor(private router: Router,
              private route: ActivatedRoute,
              private projectService: ProjectService,
              public formDataService: FormDataService,
              private titleBar: RenameTitleBarService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.titleBar.setTitle("Presentations")
    this.route.parent.parent.params.subscribe(params => {
      this.projectId = Number(params.id);
      console.log(params)
      this.route.params.subscribe(next => {
        this.presentId = next.id
        this.projectService.getOriginalProjectId(this.projectId)
          .subscribe(next => {
            this.originalPId = next

            this.formDataService.presentationId = this.presentId;
            this.formDataService.projectId = this.originalPId;
          })
      })


    });

  }

  createForm() {

    this.router.navigate(['/create-form'])
  }


  ngOnDestroy(): void {

  }

  panelStateOpen() {
    this.panelState = true
    this.onceLoaded = true
  }

  panelStateClose() {
    this.panelState = false
  }

  shareForm(event) {
    this.dialog.open(EvalListComponent, {data: {formDoc: 'ss'}, panelClass: "custom-modalbox", width: "600px"})
  }
}
