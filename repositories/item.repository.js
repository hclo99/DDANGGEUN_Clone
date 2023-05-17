const { Op } = require('sequelize');
const { Likes } = require('../models');
const { Sequelize } = require('sequelize');

class ItemRepository {
  constructor(items) {
    this.itemsModel = items;
  }

  // 판매글 전체 조회
  findAll = async (findInfo) => {
    const { page, location_id, user_id } = findInfo;
    const limit = 10;
    const offset = (page - 1) * limit;
    // itemsModel의 findAll 메소드를 호출하는 상태
    // itemsModel은 뭐임? sequelize에서 제공하는 DB 인터페이스 객체
    // findAll은 객체를 인자로 받는다. 그리고 객체의 프로퍼티에 각 명령어에 대한 값들이 들어간다. 프로퍼티의 순서는 상관없이 ORM이 재조정해준다.
    const items = await this.itemsModel.findAll({
      // order by에 접근할 수 있는 옵션.
      order: [['item_id', 'DESC']],
      include: [
        {
          model: Likes,
          attributes: [],
          where: { user_id },
          required: false,
        },
      ],
      where: { location_id, status: { [Op.ne]: 'D' } },
      limit,
      offset,
    });
    return items;
  };

  // 내 판매글 조회하기
  getMyItems = async (findInfo) => {
    const { item_id, user_id } = findInfo;
    const limit = 4;
    const items = await this.itemsModel.findAll({
      order: [['item_id', 'DESC']],
      include: [
        {
          model: Likes,
          attributes: [],
          where: { user_id },
          required: false,
        },
      ],
      where: { user_id, status: { [Op.ne]: 'D' }, item_id: { [Op.ne]: item_id} },
      limit
    });
    return items;
  }

  // 판매글 한 개 조회
  findOne = async (item_id) => {
    return await this.itemsModel.findOne({
      where: { item_id },
    });
  };

  isLiked = async (findInfo) => {
    const like = await Likes.findOne({
      where: findInfo,
    });
    if (!like) {
      return false;
    } else {
      return true;
    }
  };

  // 판매글 생성
  setItem = async (item) => {
    return await this.itemsModel.create({ ...item });
  };

  // 판매글 수정
  updateItem = async (item) => {
    const updateItemData = await this.itemsModel.update(
      {
        ...item,
      },
      { where: { item_id: item.item_id } },
    );
    return updateItemData;
  };

  // 판매글 Likes 컬럼 +1
  plusLikes = async (item_id) => {
    const incrementLikes = await this.itemsModel.increment('likes', {
      by: 1,
      where: { item_id }
    });
    return incrementLikes;
  };
  
  // 판매글 Likes 컬럼 -1
  minusLikes = async (item_id) => {
    const decrementLikes = await this.itemsModel.decrement('likes', {
      by: 1,
      where: { item_id }
    });
    return decrementLikes;
  };
}

module.exports = ItemRepository;
