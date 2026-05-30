import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ChatComposer } from './chat-composer';

describe('ChatComposer', () => {
  let fixture: ComponentFixture<ChatComposer>;
  let component: ChatComposer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComposer],
      providers: [provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComposer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits trimmed text and resets the reactive control on submit', () => {
    const emitted: string[] = [];
    component.send.subscribe((value) => emitted.push(value));
    component.messageControl.setValue('  hello  ');

    component.submit();

    expect(emitted).toEqual(['hello']);
    expect(component.messageControl.value).toBe('');
  });

  it('prevents Enter from inserting a newline when submitting', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    component.messageControl.setValue('hello');

    component.onKeydown(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(component.messageControl.value).toBe('');
  });

  it('allows Shift+Enter to keep textarea newline behavior', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    component.messageControl.setValue('hello');

    component.onKeydown(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(component.messageControl.value).toBe('hello');
  });

  it('does not emit empty or disabled messages', () => {
    const emitted: string[] = [];
    component.send.subscribe((value) => emitted.push(value));

    component.messageControl.setValue('   ');
    component.submit();

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.messageControl.setValue('hello');
    component.submit();

    expect(emitted).toEqual([]);
  });
});
