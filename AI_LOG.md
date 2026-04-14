claude.ai

En HTML d'Angular, si tinc un checkbox i un objecte que té a dins un { [key: string]: boolean } (digem-li item) amb una key (un text) i un boolean, com puc fer perquè es registri el boolean en el checkbox i que quan canvii, que se n'adoni el typescript



En Angular, pots fer servir `[(ngModel)]` o el binding de formularis reactius. Aquí la manera més senzilla amb `ngModel`:

## Cas bàsic amb `ngModel`

Suposem que tens això al TypeScript:

```typescript
item: { [key: string]: boolean } = {
  opcioA: true,
  opcioB: false,
};
```

Al template:

```html
<input
  type="checkbox"
  [(ngModel)]="item['opcioA']"
/>
```

O si la key és dinàmica:

```html
<input
  type="checkbox"
  [(ngModel)]="item[myKey]"
/>
```

---

## Amb `*ngFor` si vols iterar totes les keys

```html
<div *ngFor="let key of objectKeys(item)">
  <label>
    <input
      type="checkbox"
      [(ngModel)]="item[key]"
    />
    {{ key }}
  </label>
</div>
```

I al TypeScript:

```typescript
objectKeys = Object.keys;
```

---

## Detectar el canvi

Si vols executar lògica quan canviï, afegeixes `(ngModelChange)`:

```html
<input
  type="checkbox"
  [(ngModel)]="item[key]"
  (ngModelChange)="onCanvi(key, $event)"
/>
```

```typescript
onCanvi(key: string, nouValor: boolean) {
  console.log(`La key "${key}" ara val: ${nouValor}`);
}
```

---

## ⚠️ Requisit important

Recorda tenir `FormsModule` importat al teu mòdul (o `standalone: true` amb la importació corresponent):

```typescript
// app.module.ts
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [FormsModule, ...]
})
```

O si és un component standalone:

```typescript
@Component({
  standalone: true,
  imports: [FormsModule, NgFor],
  ...
})
```

El `[(ngModel)]` és el binding bidireccional: llegeix el valor inicial del boolean **i** actualitza'l automàticament quan l'usuari fa clic.


Canvi:
@for (task of tasks; track task._id) {
<div *ngFor="let key of objectKeys(task.tasks)">
  <label>
    <input
      type="checkbox"
      [(ngModel)]="task.tasks[key]"
    />
    {{ key }}
  </label>
</div>
}