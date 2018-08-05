import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatEntrancePage } from './chat-entrance';

@NgModule({
  declarations: [
    ChatEntrancePage,
  ],
  imports: [
    IonicPageModule.forChild(ChatEntrancePage),
  ],
})
export class ChatEntrancePageModule {}
