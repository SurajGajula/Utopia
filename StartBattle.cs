using UnityEngine;

public class StartBattle : MonoBehaviour
{
    public Player player;
    public Stats[] enemies;
    public Battle battleUI;
    public void BattleStart()
    {
        player.canMove = false;
        player.transform.position = new Vector3(transform.position.x - 8, 0, 0);
        foreach (Stats enemy in enemies)
        {
            Instantiate(enemy.gameObject, this.transform.position, Quaternion.identity);
        }
        this.gameObject.SetActive(false);
        battleUI.gameObject.SetActive(true);
        battleUI.canBattle = true;
        battleUI.enemies = enemies;
    }
}
