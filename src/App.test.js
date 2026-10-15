import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Smoke test: App mounts without a live FHIR server. Every module that touches
// the network, localForage, or the logger is mocked so componentDidMount cannot
// reach out. Assertion is deliberately weak (renders without throwing).
jest.mock('./data-services/fhirService', () => ({
  getFHIRData: jest.fn(() => Promise.reject(new Error('mocked: no FHIR server'))),
  createAndPersistClientForNewProvider: jest.fn(),
  getSupplementalDataClient: jest.fn(() => Promise.resolve(undefined)),
}));
jest.mock('./data-services/persistenceService', () => ({
  isEndpointStillAuthorized: jest.fn(() => Promise.resolve(false)),
  getSelectedEndpoints: jest.fn(() => Promise.resolve([])),
  deleteSelectedEndpoints: jest.fn(() => Promise.resolve()),
  getLauncherData: jest.fn(() => Promise.resolve(undefined)),
  deleteAllDataFromLocalForage: jest.fn(() => Promise.resolve()),
  saveSessionId: jest.fn(() => Promise.resolve()),
  isSessionId: jest.fn(() => Promise.resolve(false)),
  getSessionId: jest.fn(() => Promise.resolve(undefined)),
}));
jest.mock('./log/log-service', () => ({
  doLog: jest.fn(),
  initializeSession: jest.fn(),
}));

// jest 24's jsdom lacks TextEncoder/TextDecoder, which fhirclient's `jose` dependency
// needs at import time. Polyfill before App (and so fhirclient) is loaded.
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
const App = require('./App').default;

test('App renders without a live FHIR server', () => {
  const { container } = render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(container).toBeInTheDocument();
});
