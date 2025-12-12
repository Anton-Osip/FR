import {Button} from "@shared/ui";
import {GlobalIcon} from "@shared/assets/icons";


export const HomePage = () => {
    return <div
        style={{width: '100dvw', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Button  icon={<GlobalIcon/>}> Label</Button>
    </div>;
};
