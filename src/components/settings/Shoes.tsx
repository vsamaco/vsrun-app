import React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { type Shoe } from "~/types";
import { api } from "~/utils/api";

type ShoesFormValues = {
  shoes: Shoe[];
};

type ShoesSettingsProps = {
  shoes: Shoe[];
};

function ShoesSettingsForm({ shoes }: ShoesSettingsProps) {
  const methods = useForm<ShoesFormValues>({
    defaultValues: {
      shoes: shoes,
    },
  });
  const { control, register, handleSubmit } = methods;

  const { fields } = useFieldArray({
    control,
    name: "shoes",
  });

  const utils = api.useContext();
  const updateProfile = api.runProfile.updateProfile.useMutation({
    onSuccess: async (newEntry) => {
      await utils.runProfile.getProfile.invalidate();
    },
    onError: (error) => {
      console.log({ error });
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log("submit", data);
    updateProfile.mutate({ shoes: data.shoes });
  });

  return (
    <form onSubmit={onSubmit}>
      <h2>ShoesSettingsForm</h2>
      <div>
        {fields.map((shoe, index) => {
          return (
            <li key={shoe.id}>
              <input {...register(`shoes.${index}.brand_name`)} />
              <input {...register(`shoes.${index}.model_name`)} />
              <div>Distance: {shoe.distance}</div>
            </li>
          );
        })}
      </div>
      <button type="submit">Save</button>
    </form>
  );
}

export default ShoesSettingsForm;
