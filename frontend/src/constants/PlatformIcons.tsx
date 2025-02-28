import {Image} from "@mantine/core";
import logo_boj from "/platforms/boj.png";
import logo_codeforces from "/platforms/codeforces.png";
import {Platform} from "../types/enum/Platforms.tsx";

const PlatformIcons: Record<string, JSX.Element> = {
    [Platform.BOJ]: <Image w={32} src={logo_boj}/>,
    [Platform.CODEFORCES]: <Image w={32} src={logo_codeforces}/>
};

export default PlatformIcons;