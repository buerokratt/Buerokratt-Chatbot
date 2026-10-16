const fs = require('fs');
const p = '/app/node_modules/@buerokratt-ria/common-gui-components/templates/history-page/src/index.tsx';
const s = fs.readFileSync(p, 'utf8');
const a = "            if (selectedChat)\n                setSelectedChat({\n                    ...selectedChat,\n                    lastMessageEvent: res.data.response[0].lastMessageEvent,\n                    lastMessageTimestamp: res.data.response[0].lastMessageTimestamp,\n                    userDisplayName: res.data.response[0].userDisplayName,\n                });";
const b = "            setSelectedChat(current => {\n                if (!current) return current;\n                const matching = (res.data.response ?? []).find((chat: ChatType) => chat.id === current.id);\n                return matching ? {\n                    ...current,\n                    lastMessageEvent: matching.lastMessageEvent,\n                    lastMessageTimestamp: matching.lastMessageTimestamp,\n                    userDisplayName: matching.userDisplayName,\n                } : current;\n            });";
if (s.split(a).length !== 2) throw new Error('unexpected pinned history component');
const oldDetail = '            setSelectedChat(res.data.response);';
const newDetail = `            const detail = res.data.response;
            const matching = filteredEndedChatsList.find(chat => chat.id === detail.id);
            setSelectedChat(matching ? { ...detail,
                lastMessageEvent: matching.lastMessageEvent,
                lastMessageTimestamp: matching.lastMessageTimestamp,
                userDisplayName: matching.userDisplayName,
            } : detail);`;
if (s.split(oldDetail).length !== 2) throw new Error('unexpected pinned history detail');
fs.writeFileSync(p, s.replace(a,b).replace(oldDetail,newDetail));
