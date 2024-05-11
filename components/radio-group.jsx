import { RadioGroup } from '@headlessui/react';

export default function RadioSettings({searchType, setSearchType}) {
    return (
        <RadioGroup by="id">
                <RadioGroup.Option>
                    Prueba
                </RadioGroup.Option>
        </RadioGroup>
    );
}