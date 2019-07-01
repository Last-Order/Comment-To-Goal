<template>
  <v-flex>
    <v-data-table :headers="headers" :items="gifts" class="elevation-1" :hide-actions="true">
      <template v-slot:items="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ amount }}</td>
      </template>
    </v-data-table>
  </v-flex>
</template>
<style>
</style>

<script>
export default {
  props: ["gifts", "amount"],
  data() {
    return {
      headers: [
        {
          text: this.$vuetify.t("$vuetify.goal.giftName"),
          sortable: false
        },
        {
          text: this.$vuetify.t("$vuetify.goal.giftAmount"),
          sortable: false
        }
      ]
    };
  }
};
</script>
