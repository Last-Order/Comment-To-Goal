import axios from 'axios';

class Bilibili {
    static async getAllGiftList() {
        return (await axios.get('https://api.live.bilibili.com/gift/v3/live/gift_config')).data.data;
    }
    static async getRoomGiftList(roomId, allGiftList) {
        const GET_ROOM_GIFT_LIST_API = `https://api.live.bilibili.com/gift/v3/live/room_gift_list?roomid=${roomId}&platform=all`;
        const roomGiftList = (await axios.get(GET_ROOM_GIFT_LIST_API)).data.data.list;
        if (allGiftList) {
            const availableGiftIds = Array.from(roomGiftList, gift => gift.gift_id);
            return allGiftList.filter(gift => availableGiftIds.includes(gift.id));
        }
        return roomGiftList;
    }
    static getRoomIdFromUrl(url) {
        return url.match(/live.bilibili.com\/(\d+?)[?$]*/)[1];
    }
}

export default Bilibili;