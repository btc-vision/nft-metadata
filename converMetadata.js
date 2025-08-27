import fs from 'fs';
import { jsonrepair } from 'jsonrepair'

const file = fs.readFileSync('FINALMOTOCATDATA.json', 'utf-8');
const repaired = jsonrepair(file);

const data = JSON.parse(repaired);

const finalData = [];

for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemData = item.meta;

    const nft = {
        name: `MotoCat ${itemData.name}`,
        description: 'MotoCat is a collection of 10,000 unique MotoCats living on the Bitcoin blockchain. Each MotoCat is a combination of various traits and attributes, making them one-of-a-kind digital collectibles. Join the MotoCat community and ride into the future with your very own MotoCat!',
        image: `https://metadata.motocats.xyz/${itemData.name.replace('#', '')}.jpg`,
        attributes: itemData.attributes,
    }

    finalData.push(nft);
}

fs.writeFileSync('metadata.json', JSON.stringify(finalData, null, 4));
