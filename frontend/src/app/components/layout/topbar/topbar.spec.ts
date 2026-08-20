import { TestBed } from '@angular/core/testing';
import { TaskPriority } from '../../../models/task.model';
import { Topbar } from './topbar';

describe('Topbar', () => {
  it('emits newTask when the "Nueva tarea" button is clicked', async () => {
    const fixture = TestBed.createComponent(Topbar);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted = false;
    fixture.componentInstance.newTask.subscribe(() => (emitted = true));

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.btn-primary')?.click();

    expect(emitted).toBe(true);
  });

  it('emits searchChange with the typed value', async () => {
    const fixture = TestBed.createComponent(Topbar);
    fixture.detectChanges();
    await fixture.whenStable();

    let emitted: string | undefined;
    fixture.componentInstance.searchChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onSearchInput('reunión');

    expect(emitted).toBe('reunión');
  });

  it('toggles the priority filter menu open and closed', async () => {
    const fixture = TestBed.createComponent(Topbar);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.filterOpen()).toBe(false);
    fixture.componentInstance.toggleFilter();
    expect(fixture.componentInstance.filterOpen()).toBe(true);
    fixture.componentInstance.toggleFilter();
    expect(fixture.componentInstance.filterOpen()).toBe(false);
  });

  it('emits priorityFilterChange and closes the menu when an option is selected', async () => {
    const fixture = TestBed.createComponent(Topbar);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.toggleFilter();

    let emitted: string | undefined;
    fixture.componentInstance.priorityFilterChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.selectPriority(TaskPriority.HIGH);

    expect(emitted).toBe(TaskPriority.HIGH);
    expect(fixture.componentInstance.filterOpen()).toBe(false);
  });
});
