<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  background: #0a1a0a;
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(46, 125, 50, 0.25) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(27, 94, 32, 0.15) 0%, transparent 40%);
  min-height: 100dvh;
  color: white;
}

.app {
  min-height: 100dvh;
}
</style>
