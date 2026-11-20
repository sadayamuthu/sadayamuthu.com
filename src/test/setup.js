import '@testing-library/jest-dom'

// jsdom does not implement scrolling; node-environment tests have no window
if (typeof window !== 'undefined') window.scrollTo = () => {}
