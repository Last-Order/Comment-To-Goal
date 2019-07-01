<template>
  <v-card>
    <v-card-title>
      <span class="headline">{{ $vuetify.t('$vuetify.goal.add') }}</span>
    </v-card-title>
    <v-card-text>
      <v-container>
        <v-layout>
          <v-form>
            <v-flex>
              <v-select
                :label="$vuetify.t('$vuetify.goal.selectGift')"
                :items="gifts"
                :item-text="itemText"
                item-value="id"
                v-model="form.giftId"
              ></v-select>
            </v-flex>
            <v-flex>
              <v-text-field
                :label="$vuetify.t('$vuetify.goal.setAmount')"
                v-model="form.amount"
                type="number"
              ></v-text-field>
            </v-flex>
          </v-form>
        </v-layout>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="save">{{ $vuetify.t('$vuetify.index.confirm') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: ["gifts"],
  data() {
    return {
      options: [],
      form: {
        giftId: undefined,
        amount: 0
      }
    };
  },
  methods: {
    save() {
      if (!this.form.giftId) {
        return this.$emit('error', this.$vuetify.t('$vuetify.goal.pleaseSelectGiftType'));
      }
      if (!this.form.amount) {
        return this.$emit('error', this.$vuetify.t('$vuetify.goal.pleaseSetGiftAmount'));
      }
      this.$emit('saved', {
        giftId: this.form.giftId,
        amount: this.form.amount
      });
    },
    itemText(gift) {
      return `${gift.name} / ${gift.price}pt`;
    }
  }
};
</script>
