import axios, { AxiosResponse } from 'axios';
import notificationToSlack from 'src/hooks/notificateToSlack';

type Floor = 'basement' | 'ground' | 'rooftop';

interface Room {
  roomNumber: string;
  roomName: string;
}

interface FormattedInfo extends Room {
  floor: number;
  floorType: Floor;
}

type TotalInfo = {
  [key in Floor]: {
    [key in string]: Room[];
  };
};

const configPaylod = (code: string) => {
  const payload = new URLSearchParams();
  payload.append('code', code);
  payload.append('stat', 'D');

  return payload;
};

const handleLayerType = (layerType: string) => {
  if (layerType === '0') return 'ground';
  if (layerType === '1') return 'basement';
  if (layerType === '2') return 'rooftop';
};

const formatTotalInfo = (formattedInfo: FormattedInfo[]) => {
  const totalInfo: TotalInfo = {
    basement: {},
    ground: {},
    rooftop: {},
  };

  formattedInfo.forEach(({ roomNumber, roomName, floor, floorType }) => {
    const type = floorType as Floor;

    if (!Object.prototype.hasOwnProperty.call(totalInfo[type], floor)) {
      totalInfo[type][floor] = [{ roomNumber, roomName }];
      return;
    }

    totalInfo[type][floor].push({ roomNumber, roomName });
  });

  return totalInfo;
};

const formatFetchedInfo = (data: AxiosResponse['data']) => {
  const formattedData: FormattedInfo[] = data.response.deps2.reduce(
    (accData: FormattedInfo[], curr: any) => {
      const item = {
        roomNumber: curr.roomNo,
        roomName: curr.roomName,
        floor: curr.layer,
        floorType: handleLayerType(curr.layerTyp),
      };

      return [...accData, item];
    },
    [] as FormattedInfo[],
  );

  const formattedInfo = formatTotalInfo(formattedData);

  return formattedInfo;
};

const fetchBuildingInfo = async (code: string) => {
  const REQUEST_URL = 'https://www.pknu.ac.kr/buildingInfoAjax.do';
  const HEADERS = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  };
  const payload = configPaylod(code);

  try {
    const response = await axios.post(REQUEST_URL, payload.toString(), {
      headers: HEADERS,
    });

    const formattedInfo = formatFetchedInfo(response.data);

    return formattedInfo;
  } catch (error) {
    notificationToSlack('건물 정보 요청에 문제가 발생했습니다.');
    console.log(error);
  }
};

export default fetchBuildingInfo;
