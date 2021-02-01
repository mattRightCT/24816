import '../components/global.css'
import React from 'react'

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  // todo need to test that this is bringing in global styles
  return <Component {...pageProps} />
}
