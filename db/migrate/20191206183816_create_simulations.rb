class CreateSimulations < ActiveRecord::Migration[6.0]
  def self.up
    create_table :simulations do |t|
      t.integer :n
      t.integer :o
      t.timestamps
    end
  end

  def self.down
    drop_table :simulations
  end
end