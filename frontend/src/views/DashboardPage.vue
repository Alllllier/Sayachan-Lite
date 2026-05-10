<script setup lang="ts">
import Dashboard from '../components/Dashboard.vue'
import { Panel } from '../components/ui/shell'
import { t } from '../i18n/productLocale'
</script>

<template>
  <Panel :title="t('dashboard.title')">
    <Dashboard />
  </Panel>
</template>
