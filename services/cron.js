const { CronJob } = require('cron');
const { op } = require('sequelize');
const chats = require('../models/chats');
const ArchivedChats = require('../models/Archieved_chats');

exports.job = new CronJob(
    '0 0 * * *',
    function () {
        archiveOldRecords();
    },
    null,
    true,
    'Asia/Kolkata'
);

async function archiveOldRecords() {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        //finding record to archieve
        const recordsToArchive = await chats.findAll({ where: { datedate_time: { [op.lt]: oneDayAgo } } });

        await Promise.all(
            recordsToArchive.map(async (record) => {
                await ArchivedChats.create({
                    id: record.id,
                    Chats: record.Chats,
                    userName: record.userName,
                    fileStatus: record.fileStatus,
                    fileUrl: record.fileUrl,
                    date_time: record.date_time,
                    userId: record.userId,
                    groupId: record.groupId
                });
                await record.destroy();

            })
        )

        console.log('Old records archived');

    }
    catch (err) {
        console.error('Error archiving old records:', err);
    }
}