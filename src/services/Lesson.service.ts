import { Op } from "sequelize";
import Lesson from "../models/Lesson.Model";

export const detailLesson = async (id: number) => {
  return Lesson.findByPk(id);
};

export const AddLessonContinue = async (
  name: string,
  description: string,
  context: string,
  course_id: number
) => {
  const maxOrderNumber =
    ((await Lesson.max("inCourse", {
      where: { course_id },
    })) as number) || 0;
  const newLesson = await Lesson.create({
    name,
    description,
    context,
    course_id,
    inCourse: maxOrderNumber + 1,
  });
  return newLesson;
};

export const InsertLesson = async (
  name: string,
  description: string,
  context: string,
  course_id: number,
  insertPosition: number
) => {
  const maxOrderNumber =
    ((await Lesson.max("inCourse", {
      where: { course_id },
    })) as number) || 0;
  if (insertPosition > maxOrderNumber) {
    await AddLessonContinue(name, description, context, course_id);
    return;
  }
  await Lesson.increment("inCourse", {
    by: 1,
    where: {
      course_id,
      inCourse: {
        [Op.gte]: insertPosition,
      },
    },
  });

  const newLesson = await Lesson.create({
    name,
    description,
    context,
    course_id,
    inCourse: insertPosition,
  });

  return newLesson;
};

export const LessonInCourse = async (course_id: number) => {
  const { rows: lesson, count } = await Lesson.findAndCountAll({
    where: { course_id },
    order: [["inCourse", "ASC"]],
    attributes: ["id", "name", "inCourse", "description"],
  });
  return { rows: lesson, count };
};

export const UpdateLessonOrder = async (
  currentLesson: Lesson,
  newOrder: number
) => {
  const currentOrder = currentLesson.inCourse;
  const course_id = currentLesson.course_id;
  if (currentOrder === newOrder) {
    return currentLesson;
  }
  const maxOrderNumber =
    ((await Lesson.max("inCourse", {
      where: { course_id },
    })) as number) || 0;

  if (currentOrder > newOrder) {
    await Lesson.increment("inCourse", {
      by: 1,
      where: {
        course_id,
        inCourse: {
          [Op.gte]: newOrder,
          [Op.lt]: currentOrder,
        },
      },
    });
  } else {
    if (newOrder > maxOrderNumber) {
      newOrder = maxOrderNumber;
    }
    await Lesson.increment("inCourse", {
      by: -1,
      where: {
        course_id,
        inCourse: {
          [Op.gt]: currentOrder,
          [Op.lte]: newOrder,
        },
      },
    });
  }
  currentLesson.inCourse = newOrder;
  await currentLesson.save();
  return currentLesson;
};
