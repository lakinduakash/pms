import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Section, SectionAttribute} from "../../core/model/form-model";
import {FormEditEventService} from "../form-edit-event.service";

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements OnInit {


  //Input binding(We can get the section object we have created in formModel)
  @Input("section") section: Section;
  @Output("criteriaAdd") crAdd = new EventEmitter();
  @Output('deleteSection') deleteSection = new EventEmitter();

  secDesc;
  secTitle;

  private static lastId = 0;


  constructor(
    public formEditEvent: FormEditEventService
  ) {
  }

  ngOnInit() {
    if (this.section != undefined) {
      this.secDesc = this.section.description;
      this.secTitle = this.section.name
    }

  }

  /**
   * Create new criteria(Attribute) in section
   */
  onAddCriteriaClick() {
    let a = new SectionAttribute();
    a.id = SectionComponent.lastId++;

    //Convert to plain javascript object, If not we will get error from firebase when saving
    a = Object.assign({}, a);
    if (this.section.attr != undefined) {
      //Add new attribute to the section
      this.section.attr.push(a)
    } else {
      this.section.attr = [];
      this.section.attr.push(a)

    }

    this.crAdd.emit();
  }


  /**
   * Save other section details
   */
  saveFormDetails() {
    this.section.name = this.secTitle;
    this.section.description = this.secDesc
    this.formEditEvent.event.emit()

  }

  //Delte section and emmit that section have deleted
  delete() {
    this.deleteSection.emit(this.section.id)
  }

  //Delete critaria
  deleteCriteria(id) {
    let i = 0;
    for (let attr of this.section.attr) {
      if (id == attr.id)
        this.section.attr.splice(i, 1);
      i++
    }
  }

}
