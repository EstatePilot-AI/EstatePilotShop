import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PropertyChatCard } from '../property-chat-card/property-chat-card';
import { PropertyCard } from '../../models/chatbot.model';

@Component({
  selector: 'app-recommendation-panel',
  imports: [PropertyChatCard, TranslatePipe],
  templateUrl: './recommendation-panel.html',
  styleUrl: './recommendation-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationPanel {
  readonly recommendation = input.required<PropertyCard>();
  readonly alternatives = input<PropertyCard[]>([]);
}
