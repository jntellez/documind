import { registerRootComponent } from 'expo';

import App from './App';
import { initSentry, Sentry } from '@/lib/sentry';

initSentry();

const RootApp = Sentry.wrap(App);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootApp);
