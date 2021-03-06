import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import {CreatePresentationDialogComponent} from "./create-presentation-dialog/create-presentation-dialog.component";
import {PresentationService} from "../services/presentation.service";
import {PresentationData} from "../core/model/presentation";
import {ProjectService} from "../services/project.service";
import {Observable, Subscription} from "rxjs";
import * as csvJson from "csvjson";
import {NavBarTitleService} from "../components/services/nav-bar-title.service";
import {StudentTableService} from "../services/student-table.service";
import {tap} from "rxjs/operators";
import {FormDataService} from "../services/form-data.service";
import {FormControl, Validators} from "@angular/forms";


@Component({
  selector: 'app-project-main-view-component',
  templateUrl: './project-main-view-component.component.html',
  styleUrls: ['./project-main-view-component.component.css']
})
export class ProjectMainViewComponentComponent implements OnInit, OnDestroy {

  id: string;
  id_original: string;
  oid: Observable<string> = new Observable();
  presentationList: PresentationData[] = []


  showPage = false;

  groupUploaded = false;

  routS: Subscription;
  pexS: Subscription;

  listLoaded = false;
  error = false

  @ViewChild('file') file;

  public files: Set<File> = new Set();

  fileName = "";

  scheduledOn
  markingBias

  minDate = new Date()

  mark = new FormControl();


  constructor(private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog,
              private presentationService: PresentationService,
              private projectService: ProjectService,
              private titleBar: NavBarTitleService,
              private snackBar: MatSnackBar,
              private st: StudentTableService,
              private formData: FormDataService) {

    this.routS = this.route.paramMap.subscribe(next => {
      this.id = next.get('id')
      this.pexS = this.projectService.isProjectExist(Number(this.id)).subscribe(
        next => {
          if (!next) {
            this.router.navigate(['notfound'])
          }
          else {
            this.showPage = true
          }
        }
      )


    })


  }

  ngOnInit() {


    this.titleBar.setTitle("Projects")

    this.presentationService.getPresentation(Number(this.id)).subscribe(
      next => {
        this.presentationList = []
        next.docs.forEach(
          item => this.presentationList.push({
            id: item.id,
            name: item.data().name,
            description: item.data().description,
            markBias: item.data().markBias,
            scheduledTo: item.data().scheduledTo,
            created: item.data().created
          })
        )

        this.listLoaded = true
        console.log(this.presentationList)
      }, error => {
        this.error = true
      },

      () => {
        this.listLoaded = true
      }
    )


    this.presentationService.getPresentationList(Number(this.id)).subscribe(
      next => {
        next.docs.forEach(
          item => {
            this.updateList(item)


          }
        )
      }
    )

    this.projectService.getOriginalProjectId(Number(this.id)).pipe(
      tap(next => {
        this.id_original = next;
        this.formData.projectId = next

        this.projectService.getProjectDoc(this.id_original).subscribe(next => {
          if (next.students) {
            this.groupUploaded = true
          }
        })
      })
    ).subscribe()

    this.oid.subscribe(next => {

      this.projectService.getProjectDoc(next).subscribe(next => console.log(next))

    })

    this.mark.setValidators([Validators.max(100), Validators.min(0), Validators.required])


  }

  addPresentation(){
    console.log(this.id);

    const dialogRef = this.dialog.open(CreatePresentationDialogComponent, {
      width: '250px',
      panelClass:'custom-modalbox',
      data: {name: "", description: ""}
    });

    dialogRef.componentInstance.createClick.subscribe(
      next=>
      {
        this.presentationService.addPresentation(Number(this.id),
          {
            name: dialogRef.componentInstance.data.name,
            description: dialogRef.componentInstance.data.description,
            markBias: dialogRef.componentInstance.data.markBias,
            scheduledTo: dialogRef.componentInstance.data.scheduledDate,
            created: dialogRef.componentInstance.data.created
          } as PresentationData).subscribe(next => console.log(this.presentationList))

      }
    )


  }

  addPresentationButtonClick() {
    if (this.groupUploaded)
      this.addPresentation()
    else {
      this.snackBar.open('First upload the group csv file', 'dismiss')
    }
  }

  saveUpdates(prid) {

  }

  updateList(item) {
    if (this.presentationList.length > 0) {
      let canBeAdded: boolean = true
      for (let i of this.presentationList) {
        if (i.id == item.id) {
          canBeAdded = false
        }
      }

      if (canBeAdded)
        this.presentationList.push({
          id: item.id,
          name: item.data().name,
          description: item.data().description,
          markBias: item.data().markBias,
          created: item.data().created,
          scheduledTo: item.data().scheduledTo
        })
    }
    else {
      this.presentationList.push({
        id: item.id,
        name: item.data().name,
        description: item.data().description,
        markBias: item.data().markBias,
        created: item.data().created,
        scheduledTo: item.data().scheduledTo
      })
    }
  }

  ngOnDestroy(): void {

    this.routS.unsubscribe()
    this.pexS.unsubscribe()
  }

  openCreateForm() {

  }

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {

        this.files.add(files[key]);

        let options = {
          delimiter: ',', // optional
          quote: '"' // optional
        };

        let fileReader = new FileReader();

        fileReader.onload = (e) => {

          let a = csvJson.toObject(fileReader.result, options);


          this.snackBar.open("File uploaded", "Dismiss", {
            duration: 2000,
          }).onAction().subscribe((next) => this.snackBar.dismiss());
          console.log(a);

          this.projectService.getOriginalProjectId(Number(this.id)).pipe(
            tap(next => this.st.saveTable(next, a)),
            tap(next => console.log(next))
          ).subscribe(next => this.groupUploaded = true)

        };

        fileReader.readAsText(files[0])
        this.fileName = files[0].name


      }

    }
  }


  clickAddFiles() {
    this.file.nativeElement.click()
  }

  viewStudents() {
    this.router.navigate([`project/${this.id}/students`, {outlets: {pr: ['']}}])
  }

  deletePresentation(presentId) {
    let dialogRef = this.dialog.open(ConfirmationDialog, {width: '300px', panelClass: 'custom-modalbox'});

    dialogRef.afterClosed().subscribe(next => {
      if (dialogRef.componentInstance.yesClicked) {
        this.presentationService.deletePresentation(Number(this.id), presentId).subscribe(
          next => {
            this.snackBar.open('Presentation deleted', 'Ok')
            this.presentationService.getPresentation(Number(this.id)).subscribe(
              next => {
                this.presentationList = []
                next.docs.forEach(
                  item => this.presentationList.push({
                    id: item.id,
                    name: item.data().name,
                    description: item.data().description,
                    markBias: item.data().markBias,
                    created: item.data().created,
                    scheduledTo: item.data().scheduledTo
                  })
                )
              }
            )
          }
        )
      }

    })

  }

}


@Component({
  selector: 'app-c-dialog',
  template: `
    <h1 mat-dialog-title>Delete Presentation?</h1>
    <div mat-dialog-content>

      This action cannot be undo.
      All the content related to this presentation will be lost.
      But calculated marks will be not changed. Do you want to delete?

    </div>
      <div mat-dialog-actions>
        <button mat-button cdkFocusInitial (click)="onNoClick()">Cancel</button>
        <button mat-button (click)="onYesClick()">Delete</button>
      </div>

  `
})

export class ConfirmationDialog implements OnInit {

  yesClicked = false;

  constructor(public dialogRef: MatDialogRef<ConfirmationDialog>) {

  }


  ngOnInit(): void {
  }

  onYesClick() {
    this.yesClicked = true;
    this.dialogRef.close()
  }

  onNoClick() {
    this.dialogRef.close()
  }
}
