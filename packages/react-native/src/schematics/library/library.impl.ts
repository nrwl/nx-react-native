import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';

export default function (options: any): Rule {
  return chain([
    externalSchematic('@nrwl/react', 'library', {
      ...options,
      component: false,
      style: 'none',
    }),
  ]);
}
