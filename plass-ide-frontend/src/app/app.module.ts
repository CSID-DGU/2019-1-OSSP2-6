import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    BrowserAnimationsModule,
    NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { SharedModule } from 'primeng/shared';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanActivateGuard } from './can-activate-guard';
import { ConsoleModule } from './console/console.module';
import { LoginModule } from './login/login.module';
import { MainModule } from './main/main.module';
import { DirectoryModule } from './directory/directory.module';
import { ProblemsModule } from './problems/problems.module';
import { MyPageModule } from './mypage/mypage.module';
import { ProblemConsoleModule } from './problemConsole/problem-console.module';
import { SignupModule } from './signup/signup.module';

import { Globals } from './globals';


@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        AppRoutingModule,
        SharedModule,
        HttpClientModule,
        LoginModule,
        ConsoleModule,
        MainModule,
        DirectoryModule,
        ProblemsModule,
        MyPageModule,
        ProblemConsoleModule,
        SignupModule
    ],
    providers: [
        CanActivateGuard,
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        Globals
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {
}
