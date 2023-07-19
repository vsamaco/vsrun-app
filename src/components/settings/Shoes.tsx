import React, { useRef, useState } from "react";
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

  const { fields, append, remove } = useFieldArray({
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

  const handleImportShoes = (shoe: Shoe) => {
    console.log("import shoes", shoe);
    append(shoe);
  };

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
              <button type="button" onClick={() => remove(index)}>
                Delete
              </button>
            </li>
          );
        })}
      </div>
      <ImportStravaShoes handleImportShoes={handleImportShoes} />
      <button type="submit">Save</button>
    </form>
  );
}

type ImportStravaShoesProps = {
  handleImportShoes: (shoe: Shoe) => void;
};

function ImportStravaShoes({ handleImportShoes }: ImportStravaShoesProps) {
  const { data: shoes, isLoading } = api.strava.getShoes.useQuery();

  const [selectedShoe, setSelectedShoe] = useState<Shoe>();
  const checkboxRef = useRef<HTMLInputElement[]>([]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!shoes) {
    return <div>Not found</div>;
  }

  const handleImportButton = () => {
    if (selectedShoe) {
      handleImportShoes(selectedShoe);
      uncheckAll();
    }
  };

  const uncheckAll = () => {
    checkboxRef.current.forEach((checkbox) => {
      if (checkbox) {
        checkbox.checked = false;
      }
    });
  };

  return (
    <div>
      <button type="button" onClick={() => handleImportButton()}>
        Import
      </button>
      <ul>
        {shoes.map((shoe, index) => {
          return (
            <li key={shoe.id}>
              <input
                type="checkbox"
                onClick={() => setSelectedShoe(shoe)}
                ref={(element) => {
                  if (element) {
                    checkboxRef.current.push(element);
                  }
                }}
              />
              {shoe.brand_name} {shoe.model_name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ShoesSettingsForm;
