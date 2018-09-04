import {Component, Input, OnInit} from '@angular/core';
import {FormModel, Section} from "../core/model/form-model";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  @Input("sections") sectionList: Section[];
  @Input("formModel") form: FormModel;

  formTitle;
  formDesc;
  id;


  constructor() {
  }

  ngOnInit() {
    if (this.form != undefined) {
      this.formTitle = this.form.name;
      this.formDesc = this.form.description;
      this.id = this.form.id;
    }
  }

  onAddSectionClick() {
    let mSection = new Section();

    if (this.sectionList != undefined) {
      this.sectionList.push(mSection)
    }
    else {
      this.sectionList = [];
      this.sectionList.push(mSection)
    }

    console.log(this.sectionList)


  }

  onRemoveSectionClick() {
    if (this.sectionList != undefined && this.sectionList.length > 0) {
      this.sectionList.splice(this.sectionList.length - 1, 1)
    }

  }

  renderSection() {

  }

  onSave() {
    if (this.sectionList != undefined) {
      if (this.form != undefined) {
        this.form = {
          id: this.id,
          description: this.formDesc,
          sections: this.sectionList,
          name: this.formTitle
        } as FormModel
      }
      else {

      }
    }
  }

}