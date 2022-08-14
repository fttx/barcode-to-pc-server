import { Component, Input } from '@angular/core';
import { UtilsProvider } from '../../providers/utils/utils';

/**
 * Generated class for the VariablesListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'variables-list',
  templateUrl: 'variables-list.html'
})

export class VariablesListComponent {
  @Input('description') description: string = '';
  constructor(
    private utils: UtilsProvider,
  ) {
    this.setDefaultDescription();
  }

  async setDefaultDescription() {
    this.description = await this.utils.text('availableVariables');
  }
}
