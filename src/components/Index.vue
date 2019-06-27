<template>
  <v-container class="main-container" ref="mainContainer" grid-list-md :class="containerClass">
    <div class="control-panel-container">
      <v-icon small @click="showSettingPanel = true">settings</v-icon>
      <v-icon small @click="refresh">refresh</v-icon>
    </div>
    <v-dialog v-model="showAddGoalPanel">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $vuetify.t('$vuetify.index.add') }}</span>
        </v-card-title>
        <v-card-text>
          <setting-panel></setting-panel>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showSettingPanel">
      <v-card>
        <v-card-title>
          <span class="headline">设置</span>
        </v-card-title>
        <v-card-text>
          <setting-panel></setting-panel>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="error.show" color="error" :top="true" :timeout="5000">
      {{ error.message }}
      <v-btn dark flat @click="error.show = false">×</v-btn>
    </v-snackbar>
    <v-snackbar v-model="notice.show" :top="true">
      {{ notice.message }}
      <v-btn dark flat @click="notice.show = false">×</v-btn>
    </v-snackbar>
    <v-layout row wrap>
      <v-flex xs6>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.index.fillBasicInfo') }}</h3>
            <v-form>
              <v-text-field
                v-model="videoUrl"
                :label="$vuetify.t('$vuetify.index.pleaseInputVideoUrl')"
              />
              <v-select
                :items="languages"
                label="选择语言 / Select Language"
                item-text="label"
                item-value="value"
                v-model="nowLanguage"
              ></v-select>
            </v-form>
          </v-card-text>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.goal.title') }}</h3>
            <v-btn
              color="primary"
              :loading="loadingAllGiftList || loadingRoomGiftList"
              :disabled="loadingAllGiftList || loadingRoomGiftList"
              @click="addGoal"
            >{{ $vuetify.t('$vuetify.goal.add') }}</v-btn>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs6>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.control.title') }}</h3>
            <v-btn
              color="primary"
              @click="start"
              :loading="startButtonLoading"
              :disabled="status !== 'idle'"
            >{{ $vuetify.t('$vuetify.control.start') }}</v-btn>
            <v-btn
              v-if="status === 'polling'"
              color="red"
              @click="stop"
            >{{ $vuetify.t('$vuetify.control.end') }}</v-btn>
          </v-card-text>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.result.title') }}</h3>
          </v-card-text>
          <result-graph :graph="result"/>
        </v-card>
        <v-card class="index-cards">
          <v-card-text>
            <h3>{{ $vuetify.t('$vuetify.display.title') }}</h3>
            <blockquote>
              <code>http://localhost:9317</code>
            </blockquote>
            <br>
            <p>{{ $vuetify.t('$vuetify.display.instruction') }}</p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import ResultGraph from "./Home/ResultGraph";
import CommentListener from "../services/comment";
import SettingPanel from "./Settings/Index";
import AddGoalPanel from './Home/AddGoal';
import Bilibili from "../services/api/bilibili";
const fs = require("fs");
const path = require("path");
const socketio = require("socket.io-client");
import "./Index.css";

export default {
  data() {
    return {
      showSettingPanel: false,
      showAddGoalPanel: false,
      startButtonLoading: false,
      videoUrl: "",
      videoId: "",
      chatId: "",
      error: {
        show: false,
        message: ""
      },
      notice: {
        show: false,
        message: ""
      },
      result: {},
      resultBuffer: {},
      languages: [
        {
          label: "中文",
          value: "zh"
        },
        {
          label: "日本語",
          value: "ja"
        },
        {
          label: "English",
          value: "en"
        }
      ],
      nowLanguage: navigator.language.slice(0, 2),
      status: "idle",
      socketClient: undefined,
      commentListener: undefined,
      commitResultBufferInterval: undefined,
      polledUser: {},
      allGiftList: [],
      roomGiftList: [],
      loadingAllGiftList: false,
      loadingRoomGiftList: false
    };
  },
  computed: {
    containerClass() {
      return {
        "lang-ja": this.nowLanguage === "ja",
        "lang-zh": this.nowLanguage === "zh",
        "lang-en": this.nowLanguage === "en"
      };
    }
  },
  mounted() {
    this.socketClient = socketio("http://localhost:9317");
    if (localStorage.getItem("language")) {
      this.nowLanguage = localStorage.getItem("language");
    }
    this.getAllGiftList();
  },
  watch: {
    nowLanguage: function(language) {
      localStorage.setItem("language", language);
      this.socketClient.emit("update-language", language);
      this.$vuetify.lang.current = language;
    }
  },
  methods: {
    async getAllGiftList() {
      this.loadingAllGiftList = true;
      try {
        this.allGiftList = await Bilibili.getAllGiftList();
      } catch (e) {
        this.showErrorMessage(
          this.$vuetify.t("$vuetify.goal.failToGetGiftList")
        );
      }
      this.loadingAllGiftList = false;
    },
    /**
     * Start polling
     */
    async start() {
      if (!this.videoUrl) {
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.noVideoUrl")
        );
      }
      this.startButtonLoading = true;
      // Get live basic information
      this.commentListener = new CommentListener({
        url: this.videoUrl
      });
      try {
        await this.commentListener.init();
      } catch (e) {
        this.startButtonLoading = false;
        return this.showErrorMessage(
          this.$vuetify.t("$vuetify.control.failToGetVideoId")
        );
      }
      this.startButtonLoading = false;
      this.polledUser = {};
      // reset result
      const result = {};
      const resultBuffer = {};
      for (const index in this.options) {
        result[String.fromCharCode(65 + parseInt(index))] = 0;
        resultBuffer[String.fromCharCode(65 + parseInt(index))] = 0;
      }
      this.result = result;
      this.resultBuffer = resultBuffer;
      this.status = "polling";
      // start polling to retrieve live comments
      this.polling();
    },
    /**
     * Stop polling
     */
    async stop() {
      this.status = "idle";
      this.socketClient.emit("update-result", JSON.stringify(this.result));
      this.commentListener.disconnect();
      clearInterval(this.commitResultBufferInterval);
      this.commitResultBuffer();
    },
    async polling() {
      this.commentListener.connect();
      this.commentListener.on("comment", comment => {
        
      });
      this.commentListener.on("error", e => {
        this.showErrorMessage(e.toString());
      });
      this.commitResultBufferInterval = setInterval(
        this.commitResultBuffer,
        1500
      );
    },
    async addGoal() {
      if (!this.videoUrl) {
        return this.showErrorMessage(this.$vuetify.t("$vuetify.goal.noVideoUrl"));
      }
      if (this.allGiftList.length === 0) {
        this.showErrorMessage(this.$vuetify.t("$vuetify.goal.emptyGiftList"));
        return this.getAllGiftList();
      }
      if (!this.videoUrl.match(/live.bilibili.com\/(\d+?)[?$]*/)) {
        return this.showErrorMessage(this.$vuetify.t("$vuetify.goal.invalidVideoUrl"));
      }
      // filter out gifts available for this room
      const roomId = Bilibili.getRoomIdFromUrl(this.videoUrl);
      this.loadingRoomGiftList = true;
      try {
        this.roomGiftList = await Bilibili.getRoomGiftList(roomId, this.allGiftList);
      } catch (e) {
        this.showErrorMessage(this.$vuetify.t("$vuetify.goal.failToGetRoomGiftList"));
      }
      this.loadingRoomGiftList = false;
    },
    incResult(key) {
      this.resultBuffer[key] += 1;
    },
    commitResultBuffer() {
      for (const key of Object.keys(this.resultBuffer)) {
        this.result[key] = this.result[key] + this.resultBuffer[key];
        this.resultBuffer[key] = 0;
      }
    },
    saveOptions() {
      fs.writeFileSync(
        // eslint-disable-next-line
        path.resolve(__static, "../runtime/options.json"),
        JSON.stringify(this.options)
      );
      this.socketClient.emit("refresh-options", "");
      this.socketClient.emit("update-language", this.nowLanguage);
      this.showNotice(this.$vuetify.t("$vuetify.index.optionSaved"));
    },
    handlePollOptionDelete(index) {
      this.options = [
        ...this.options.slice(0, index),
        ...this.options.slice(index + 1)
      ];
    },
    handleOptionAdded(label) {
      this.options.push({
        label
      });
      this.showAddOptionDialog = false;
    },
    showErrorMessage(message) {
      this.error.show = true;
      this.error.message = message;
    },
    showNotice(message) {
      this.notice.show = true;
      this.notice.message = message;
    },
    hideNotice() {
      this.notice.show = false;
    },
    refresh() {
      location.reload();
    }
  },
  components: {
    ResultGraph,
    SettingPanel,
    AddGoalPanel
  }
};
</script>