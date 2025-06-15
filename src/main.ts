import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('Starting application bootstrap...');
console.log('App config:', appConfig);

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('Application bootstrapped successfully');
  })
  .catch((err) => {
    console.error('Error bootstrapping application:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    throw err;
  });
